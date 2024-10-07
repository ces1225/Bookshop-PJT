const conn = require('../mariadb'); // db 모듈 
const {StatusCodes} = require('http-status-codes');

//( 카테고리 별, 신간 여부 ) 전체 도서 목록 조회
const allbooks = (req,res) => {
    let { category_id , newBooks , limit , currentPage }= req.query;

    // limit : page당 도서 수 (ex 3) currentPage : 현재 페이지 ( 1,2,3 )
    // offset : 0,3,6,9 limit * (currentPage - 1)
    
    let offset = limit * (currentPage - 1); 

    let sql = "SELECT * FROM books";
    let values = [];
    if (category_id && newBooks) {        
        sql += ` WHERE category_id =? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW()`;
        values = [category_id];
    } else if (category_id) {
        sql += " WHERE category_id =?"
        values = [category_id];
    } else if (newBooks) {
        sql += " WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 YEAR) AND NOW()"
    }
    
    sql += " LIMIT ? OFFSET ?"
    values.push(parseInt(limit),offset);

    conn.query(sql, values,
        ( err, results ) => {
            if (err) {
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end()
            }
            if (results.length)
                return res.status(StatusCodes.OK).json(results)
            else 
            return res.status(StatusCodes.NOT_FOUND).end()
            }
        )
    } 

const bookDetail = (req,res) => { //개별 도서 조회 (+ category_id를 통해 카테고리 테이블을 가져옴)
    let {id} = req.params;
    
    let sql = `SELECT * FROM Bookshop.books LEFT JOIN category 
    ON books.category_id = category.id WHERE books.id =?;`;
    conn.query(sql, id,
        ( err, results ) => {
            if (err) {
                console.log(err)
                return res.status(StatusCodes.BAD_REQUEST).end()
            }
            if(results[0])
                return res.status(StatusCodes.OK).json(results[0])
            else
                return res.status(StatusCodes.NOT_FOUND).end()
        }
    )
};

module.exports = {
    allbooks,
    bookDetail
}