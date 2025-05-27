const File = require('../models/File');
const fileQueue = require('../jobs/queues/fileQueue');
const ErrorResponse = require('../utils/ErrorResponse');
const { uploadHelper } = require('../helpers/uploadHelper');

exports.uploadFile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description } = req.body;
    const { fileName, filePath, extension } = await uploadHelper(
      req.file,
      userId
    );
    const { id: fileId } = await File.create({
      user_id: userId,
      original_filename: req.file.originalname,
      stored_filename: fileName,
      storage_path: filePath,
      title,
      description,
      status: 'uploaded',
    });
    const reAttemptConfig =
      extension === '.txt'
        ? {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 3000,
            },
          }
        : {};
    await fileQueue.add(
      'process-file',
      {
        fileId,
        storagePath: filePath,
      },
      reAttemptConfig
    );
    return res.status(201).json({
      data: {
        fileId,
        status: 'uploaded',
        message: 'file-uploaded-successfully',
      },
    });
  } catch (err) {
    console.error(err);
    return next(new ErrorResponse(500, 'internal-server-error'));
  }
};

exports.getFileById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const file = await File.findByPk(id);
    if (!file) {
      return next(new ErrorResponse(400, 'no-such-file-exist'));
    }
    const plainFile = file.get({ plain: true });
    const { status, extracted_data, ...metadata } = plainFile;
    if (metadata.user_id !== req.user.id) {
      return next(new ErrorResponse(401, 'yo-its-not-your-file'));
    }
    return res.status(200).json({ data: { metadata, status, extracted_data } });
  } catch (err) {
    console.error(err);
    return next(new ErrorResponse(500, 'internal-server-error'));
  }
};

exports.getFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const { count, rows } = await File.findAndCountAll({
      where: { user_id: userId },
      limit,
      offset,
      order: [
        ['id', 'DESC'],
        ['uploaded_at', 'DESC'],
      ],
    });
    res.json({
      data: {
        page,
        totalPages: Math.ceil(count / limit),
        totalFiles: count,
        files: rows,
      },
    });
  } catch (error) {
    console.error(err);
    return next(new ErrorResponse(500, 'internal-server-error'));
  }
};
