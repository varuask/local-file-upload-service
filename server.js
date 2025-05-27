const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const authRouter = require('./routes/auth');
const fileRouter = require('./routes/file');

const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  return res.status(200).json({
    data: {
      message: `billeasy-service-is-live-and-healthy`,
    },
  });
});

app.use('/auth', authRouter);
app.use('/file', fileRouter);

app.use(errorHandler);

const PORT = process.env.APP_PORT;

const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`billeasy-server-listening-to-requests-on-port->${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startServer();
