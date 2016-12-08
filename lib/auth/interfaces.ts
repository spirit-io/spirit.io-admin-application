import { _ } from 'streamline-runtime';
import { Request, Response } from "express";

export interface IAuthModule {
    authenticate(req: Request, res: Response, _: _): string;
}