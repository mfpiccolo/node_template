/* @flow */
class HomepageController {
  get(req: any, res: Object) {
    // const j = (1 + 1: number);

    res.render('index', {
      title: 'Launching the rockets',
    });
  }
}

export default new HomepageController();
