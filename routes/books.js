const express = require('express');
const router = express.Router();
const { 
    allbooks,
    bookDetail
} = require('../controller/BookController');

router.use(express.json());


//전체 도서 조회 & 카테고리별 도서 조회
router.get('/', allbooks);
//개별 도서 조회
router.get('/:id', bookDetail);

module.exports = router
