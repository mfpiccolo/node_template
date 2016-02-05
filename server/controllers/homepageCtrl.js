import express from 'express';
// import Rocket from '../models/Rocket';
/*eslint-disable*/
const router = express.Router();
/*eslint-enable*/

router.get('/', (req, res) => {
  res.render('index', {
    title: 'Launching the rockets',
  });
});

export default router;
