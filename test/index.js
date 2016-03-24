import { expect } from 'chai'
import webpackConfigRentpath from '../src'

describe('webpackConfigRentpath', function() {
  it('should be defined', function() {
    expect(webpackConfigRentpath).to.exist
  })

  it('exports "config"', function() {
    expect(webpackConfigRentpath.config).to.exist
  })

  it('exports "appEnv"', function() {
    expect(webpackConfigRentpath.appEnv).to.exist
  })

  it('exports "isDevelopment"', function() {
    expect(webpackConfigRentpath.isDevelopment).to.exist
  })

  it('defaults "appEnv" to "production"', function() {
    expect(webpackConfigRentpath.appEnv).to.eql('production')
  })
})
