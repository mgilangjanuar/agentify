import ivm from 'isolated-vm'
import { NextResponse } from 'next/server'

const runScript = async (code: string) => {
  const isolate = new ivm.Isolate({ memoryLimit: 128 })
  const context = isolate.createContextSync()
  const jail = context.global
  jail.setSync('global', jail.derefInto())

  const hostile = isolate.compileScriptSync(code)
  const fn = await hostile.run(context)
  return fn
}

export const GET = async () => {
  const resp = await (await runScript('function (a, b) { return a + b }'))(7, 2)
  console.log(resp)
  return NextResponse.json({})
}
