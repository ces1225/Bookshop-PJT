const conn = require('../mariadb'); // db 모듈
const ensureAuthorization = require('../auth'); 
const jwt = require('jsonwebtoken')
const {StatusCodes} = require('http-status-codes');


const addToCart = (req,res) => {
    const {book_id, quantity} = req.body;

    let authorization = ensureAuthorization(req,res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            "message" : "로그인 세션이 만료되었습니다. 다시 로그인해주세요"
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            "message" : "잘못된 토큰입니다."
        });
    } else {
        let sql = "INSERT INTO cartitems (book_id, quantity, user_id) VALUES (?,?,?);";
        let values = [book_id, quantity ,authorization.id];
        conn.query(sql, values,
            ( err, results ) =>{
                if (err) {
                    console.log(err)
                    return res.status(StatusCodes.BAD_REQUEST).end()
                    }
                return res.status(StatusCodes.OK).json(results)
        })    
    }
}

const getCartItems = (req,res) => {
    const {selected} = req.body; 

    let authorization = ensureAuthorization(req,res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            "message" : "로그인 세션이 만료되었습니다. 다시 로그인해주세요"
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            "message" : "잘못된 토큰입니다."
        });
    } else {
        let sql = `SELECT cartitems.id, book_id, title, summary, quantity, price 
            FROM cartitems LEFT JOIN books 
            ON cartitems.book_id = books.id
            WHERE user_id = ? `;
        let values = [authorization.id];

        if (selected) {
            sql += `AND cartitems.id IN (?);`;
            values.push(selected);
        } 
        conn.query(sql, values,
        ( err, results ) => {
        if (err) {
            console.log(err)
            return res.status(StatusCodes.BAD_REQUEST).end()
        }
        return res.status(StatusCodes.OK).json(results)
        })
    }   
}

const removeCartItem =(req,res) => { 
    const cartitemId = req.params.id; // cartItemId

    let sql = "DELETE FROM cartitems WHERE id = ?;"
    
    conn.query(sql, cartitemId,
        ( err, results ) =>{
            if (err) {
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end()
            }
            return res.status(StatusCodes.OK).json(results)
    })  
}


module.exports = { addToCart, getCartItems, removeCartItem };