import sinon from 'sinon'
import { expect } from 'chai'
import webpackConfigRentpath from '../src'

describe('webpackConfigRentpath', function () {
  it('should be defined', function () {
    expect(webpackConfigRentpath).to.exist
  })

  context('browser environment', function () {
    before(function () {
      this.jsdom = require('jsdom-global')()
    })

    after(function () {
      this.jsdom()
    })

    it('has a global window object', function () {
      expect(typeof window).to.not.equal('undefined')
    })
  })
})
