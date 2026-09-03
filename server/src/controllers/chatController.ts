import { Request, Response, NextFunction } from 'express';
import { llmService } from '../services/llm/llmService';

// ─── Standard (JSON) Chat ─────────────────────────────────────────────────────
export const handleChatMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Message content is required.' });
    }

    const response = await llmService.generateResponse(message, history || []);

    res.status(200).json({
      status: 'success',
      data: response,
    });
  } catch (err) {
    next(err);
  }
};

// ─── SSE Streaming Chat ───────────────────────────────────────────────────────
export const handleChatStream = async (req: Request, res: Response) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ status: 'error', message: 'Message content is required.' });
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendEvent = (event: string, data: object | string) => {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    res.write(`event: ${event}\ndata: ${payload}\n\n`);
  };

  try {
    await llmService.streamResponse(
      message,
      history || [],
      (token: string) => {
        sendEvent('token', { token });
      },
      (sources: any[], modelUsed: string) => {
        sendEvent('done', { sources, modelUsed });
        res.end();
      },
      (errMsg: string) => {
        sendEvent('error', { message: errMsg });
        res.end();
      }
    );
  } catch (err: any) {
    sendEvent('error', { message: err.message || 'Streaming failed.' });
    res.end();
  }
};
