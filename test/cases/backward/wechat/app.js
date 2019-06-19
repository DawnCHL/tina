import '../../../helpers/wx-globals'
import test from 'ava'
import sinon from 'sinon'

import MinaSandbox from '../../../helpers/mina-sandbox/wechat'

import Tina from '../../../..'

test.beforeEach((t) => {
  t.context.mina = new MinaSandbox({ Tina })
})
test.afterEach((t) => {
  t.context.mina.restore()
})

test.serial('`onLaunch`, `onShow`, `onHide`, `onError`, `onPageNotFound` should be called', async (t) => {
  const options = {
    onLaunch: sinon.spy(),
    onShow: sinon.spy(),
    onHide: sinon.spy(),
    onError: sinon.spy(),
    onPageNotFound: sinon.spy(),
  }
  Tina.App.define(options)

  const app = t.context.mina.getApp(-1)

  t.true(options.onLaunch.notCalled)
  t.true(options.onShow.notCalled)
  t.true(options.onHide.notCalled)
  t.true(options.onError.notCalled)
  t.true(options.onPageNotFound.notCalled)

  await app._emit('onLaunch')
  t.true(options.onLaunch.calledOnce)

  await app._emit('onShow')
  t.true(options.onShow.calledOnce)

  await app._emit('onHide')
  t.true(options.onHide.calledOnce)

  await app._emit('onError')
  t.true(options.onError.calledOnce)

  await app._emit('onPageNotFound')
  t.true(options.onPageNotFound.calledOnce)
})

test.serial('the rest of parameters could be accessed and called in context of Tina.App instance', async (t) => {
  const spy = sinon.spy()
  const options = {
    onLaunch () {
      this.foo()
    },
    data: 'qux',
    foo: sinon.stub().callsFake(function () {
      this.bar()
      spy(this.data)
    }),
    bar: sinon.spy(),
  }
  Tina.App.define(options)

  const app = t.context.mina.getApp(-1)

  t.true(options.foo.notCalled)
  t.true(options.bar.notCalled)

  await app._emit('onLaunch')

  t.true(options.foo.calledOnce)
  t.true(options.bar.calledOnce)
  t.true(spy.calledWithExactly('qux'))
})

test.serial('could not call `setData` method on App by default', async (t) => {
  const spy = sinon.spy()
  const options = {
    onLaunch () {
      try {
        this.setData({ foo: 'bar' })
      } catch (e) {
        spy(e)
      }
    },
  }
  Tina.App.define(options)

  const app = t.context.mina.getApp(-1)

  await app._emit('onLaunch')

  t.true(spy.calledOnce)
  t.is(spy.lastCall.args[0].message, '`setData` of Tina.App is not a function')
})

test.serial('`setData` method could be override on App', async (t) => {
  const spy = sinon.spy()
  const options = {
    onLaunch () {
      try {
        this.setData({ foo: 'bar' })
      } catch (e) {
        spy(e)
      }
    },
    setData: sinon.spy(),
  }
  Tina.App.define(options)

  const app = t.context.mina.getApp(-1)

  await app._emit('onLaunch')

  t.true(spy.notCalled)
  t.true(options.setData.calledOnce)
  t.true(options.setData.calledWithExactly({ foo: 'bar' }))
})

test.serial('`getApp` should return the instance created with Tina.App', async (t) => {
  const spy = sinon.spy()
  Tina.App.define({
    onLaunch () {
      spy(this)
    },
  })

  const app = t.context.mina.getApp(-1)

  await app._emit('onLaunch')

  t.is(Tina.getApp(), app.__tina_instance__)
  t.true(spy.calledOnce)
  t.true(spy.calledWithExactly(Tina.getApp()))
})
