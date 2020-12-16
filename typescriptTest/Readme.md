# Test TypeScript
This small project is designed to test the issue [#4](https://github.com/ariznaf/pruebasMoodable/issues/4) about errors detected while trying to use typescript files in moddable SDK.

When you try to create the host using mcconfig, you get an error about modules not being found when mcconfig creates tsconfig.json and tries to transpile files using tsc.

The guess is that the problem is in the manifest file or in mcconfig, in the tsconfig.json file that it creates, that lacks a path to the typings.

Compile and run the aplication under test directory to test it.