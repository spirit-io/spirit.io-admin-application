import { _ } from 'streamline-runtime';
import * as AdminServer from '../../app';
import { Application, Request, Response } from "express";
import * as helper from '../auth/helper';
import * as sessions from '../sessions';
const config = require('../../config').config;




export function setup(_, server: AdminServer) {
    // Set auth middleware for authentication
    server.middleware.authMiddleware = sessions.ensureAuthenticated;

    server.app.get('/', (req, res, _) => {
        res.send("Spirit.io-admin Application");
    });


    // Register login route
    server.app.use('/login', (req, res, _) => {
        sessions.ensureAuthenticated(req, res, _);
        let usr = req['authenticated'];
        if (usr) {
            res.json({
                $diagnoses: [{
                    $severity: 'info',
                    $message: `User '${usr}' logged in successfully`
                }]
            });
        } else {
            res.setHeader("WWW-Authenticate", "Basic");
            throw helper.unauthorized();
        }
    });

    // Register logout route
    server.app.get('/logout', (req, res, _) => {
        let usr = req.session.user;
        if (!usr) {
            res.json({
                $diagnoses: [{
                    $severity: 'error',
                    $message: `Logout failed. No session found.`
                }]
            });
        } else {
            req.session.destroy(_);
            res.json({
                $diagnoses: [{
                    $severity: 'info',
                    $message: `User '${usr}' logged out successfully`
                }]
            });
        }
    });

}
