import express from 'express';
import cors from 'cors';
import { apiRouter } from '../backend/routes';
import { firebaseAuthProxyMiddleware } from '../backend/firebaseAuthProxy';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/__/auth', firebaseAuthProxyMiddleware);
app.use('/__/firebase', firebaseAuthProxyMiddleware);
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;

