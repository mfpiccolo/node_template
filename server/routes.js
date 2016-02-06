import homepageCtrl from './controllers/homepageCtrl';

const routes = [
/**
 * Homepage
 */
  {
    path: '/',
    controller: homepageCtrl,
    type: 'GET',
  },
];

export default routes;
