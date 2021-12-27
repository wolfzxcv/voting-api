import cors from 'cors';
import express from 'express';
const app = express();
// Body parsing Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
export default app;
