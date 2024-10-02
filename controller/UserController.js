const conn = require('../mariadb'); // db 모듈 
const {StatusCodes} = require('http-status-codes');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // crypto 모듈 : 암호화
const dotenv = require('dotenv'); // dotenv 모듈
dotenv.config();

const join = (req,res) => {
    const {email,password} = req.body;

    let sql = 'INSERT INTO users (email, password, salt) VALUES (?,?,?)';
    
    //암호화된 비밀번호와 salt 값을 같이 db에 저장
    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');

    // 로그인 시, 이메일 & 비밀번호 (날것) => salt값 꺼내서 비밀번호 암호화해보고 -> db 비밀번호랑 비교
    let values = [email, hashPassword, salt];

    conn.query(sql,values,
        (err, results) => {
            if(err) {
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end() //BAD Request
            };
            res.status(StatusCodes.CREATED).json({
                message : '회원이 되신 것을 축하드립니다!'
            });
        }
    )
}

const login = (req,res) => {
    const {email, password} = req.body;

    let sql = `SELECT * FROM users WHERE email = ?`

    conn.query(sql, email,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            const loginUser = results[0];

            // 로그인 시, 이메일 & 비밀번호 (날것)
            // => salt값 꺼내서 비밀번호 암호화해보고
            //=> db 비밀번호랑 비교
            const hashPassword = crypto.pbkdf2Sync(password, loginUser.salt, 10000, 10, 'sha512').toString('base64');

            if (loginUser && loginUser.password == hashPassword) {
                
                const token = jwt.sign({
                    email : loginUser.email    
                }, process.env.PRIVATE_KEY, {
                    expiresIn : '5m',
                    issuer : "eunseok"
                });

                res.cookie('token', token,{
                    httpOnly : true
                });
                console.log(token);

                return res.status(StatusCodes.OK).json(results);
            } else {
                return res.status(StatusCodes.UNAUTHORIZED).end() 
                // 401 : 비인증 상태 ( 누군지 모름 )
                // 403 : 금지됨 ( 접근 권리 없음 )
            }
        }
    ) 
}

const PasswordResetRequest = (req,res) => {
    const {email} = req.body;

    let sql = 'SELECT * FROM users WHERE email = ?';
    
    conn.query(sql, email,
        (err, results) => {
            if(err) {
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            //이메일로 유저가 잊는지 찾아봄.
            const user = results[0];
            if (user){
                return res.status(StatusCodes.OK).json({
                    email : email
                });
            } else {
                return res.status(StatusCodes.UNAUTHORIZED).end();
            }
        }
    )
};

const PasswordReset = (req,res) => {
    const { email, password } = req.body;

    let sql = `UPDATE users SET password = ?, salt = ? WHERE email = ? `;

    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');

    let values = [hashPassword, salt, email];
    conn.query(sql,values,
        (err, results) => {
            if(err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            if (results.affectedRows == 0)
                return res.status(StatusCodes.BAD_REQUEST).end();
            else
                return res.status(StatusCodes.OK).json(results);

        }
    )
}

module.exports = {
    join,
    login,
    PasswordResetRequest,
    PasswordReset   
}
