'use strict';

var fb = require('../../waterlock-facebook-auth').fb;

/**
* Oauth action - for use with Facebook Connect auth flows - best to use the
* proper oAuth2 flow but this is here if it takes your fancy
*/
module.exports = function (req, res){
  fb.processAccessToken(req.query.code, accessTokenResponse);


  /**
  * [accessTokenResponse description]
  * @param  {[type]} error                  [description]
  * @param  {[type]} accessToken       [description]
  */
  function accessTokenResponse(error, accessToken){
    if (error && typeof accessToken !== 'undefined') {
      waterlock.logger.debug(error);
      res.serverError();
    } else {
      fb.getMe(userInfoResponse);
    }
  }

  /**
  * [userInfoResponse description]
  * @param  {[type]} error    [description]
  * @param  {[type]} data     [description]
  * @param  {[type]} response [description]
  * @return {[type]}          [description]
  */
  function userInfoResponse(error, response, body){
    if (error) {
      waterlock.logger.debug(error);
      res.serverError();
    } else {
      var _data = JSON.parse(body);

      var attr = {
        facebookId: _data.id,
        name: _data.name,
        first_name: _data.first_name,
        last_name: _data.last_name,
        gender: _data.gender,
        email: _data.email,
        birthday: _data.birthday,
        education: _data.education,
        work: _data.work,
        location: _data.location,
        picture: _data.picture,
      };

      if (!attr.facebookId)
      {
        res.badRequest("Invalid Facebook Access Token")
        return
      }

      if(req.session.authenticated){
        attr['user'] = req.session.user.id;
        waterlock.engine.attachAuthToUser(attr, req.session.user, userFound);
      }else{
        waterlock.engine.findOrCreateAuth({facebookId: attr.facebookId}, attr, userFound);
      }
    }
  }

  /**
  * [userFound description]
  * @param  {[type]} err  [description]
  * @param  {[type]} user [description]
  * @return {[type]}      [description]
  */
  function userFound(err, user){
    if(err){
      // ensure your using username instead of email
      waterlock.logger.debug(err);
      waterlock.cycle.loginFailure(req, res, null, {error: 'trouble creating model'});
    }

    waterlock.cycle.loginSuccess(req, res, user);
  }
};