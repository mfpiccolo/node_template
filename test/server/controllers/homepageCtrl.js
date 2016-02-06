import sinon from 'sinon';
import chai from 'chai';
const expect = chai.expect;

// System under test
import controller from '../../../server/controllers/homepageCtrl';

describe('Homepage Controller', () => {
  describe('GET', () => {
    const req = null;
    const res = {};

    beforeEach(() => {
      res.render = sinon.stub();
      return controller.get(req, res);
    });

    it('should call res.render with expected parameters', () =>
      expect(res.render).to.have.been.called
    );
  });
});
