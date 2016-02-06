class HomepageController {
  get(req, res) {
    res.render('index', {
      title: 'Launching the rockets',
    });
  }
}

export default new HomepageController();
