const { body, validationResult } = require('express-validator');
const validate = require('../../../middleware/validate');

describe('validate middleware', () => {
  function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  }

  it('should call next() when no validation errors', async () => {
    const req = { body: { email: 'test@example.com' }, params: {}, query: {}, headers: {} };
    const validators = [body('email').isEmail()];

    for (const v of validators) {
      await v.run(req);
    }

    const res = mockRes();
    const next = jest.fn();

    validate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 422 with errors when validation fails', async () => {
    const req = { body: { email: 'not-valid' }, params: {}, query: {}, headers: {} };
    const validators = [body('email').isEmail().withMessage('Invalid email')];

    for (const v of validators) {
      await v.run(req);
    }

    const res = mockRes();
    const next = jest.fn();

    validate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation failed.',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'email' })
        ])
      })
    );
  });
});
