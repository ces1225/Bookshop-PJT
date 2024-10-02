const express = require('express');
const router = express.Router();
const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');
const { body, validationResult } = require('express-validator');
const {
    join,
    login,
    PasswordResetRequest,
    PasswordReset   
} = require('../controller/UserController');

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

router.use(express.json());

const validate = (req, res, next) => {
    const err = validationResult(req)

    if (err.isEmpty()){
        return next();
    } else {
        return res.status(400).json(err.array())
    }
}

// 회원가입
router.post( '/join', 
    [
        body('email').notEmpty().isEmail().withMessage("이메일을 확인해주세요."),
        body('password').notEmpty().isString().withMessage('비밀번호를 확인해 주세요.')
    ], 
    join);
// 로그인
router.post('/login',
    [
        body('email').notEmpty().isEmail().withMessage("이메일을 확인해주세요."),
        body('password').notEmpty().isString().withMessage('비밀번호를 확인해 주세요.')
    ],
    login);
// 비밀번호 초기화 요청
router.post('/reset', PasswordResetRequest);
// 비밀번호 초기화
router.put('/reset', PasswordReset );

module.exports = router