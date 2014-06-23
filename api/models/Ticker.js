/**
* Ticker.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  schema: true,
  
  attributes: {

  	timestamp : { type: 'datetime' },

    bid : { type: 'float' },

    ask : { type: 'float' },

    low : { type: 'float' },

    high : { type: 'float' },

    last : { type: 'float' },

    volume : { type: 'float' }
  }
};

