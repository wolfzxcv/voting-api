import cors from 'cors';
import express, { Application } from 'express';

const app: Application = express();

// Body parsing Middleware
app.use(express.json());

app.use(cors());
app.use(express.urlencoded({ extended: true }));

export default app;
