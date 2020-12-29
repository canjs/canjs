@page guides.ContributingWindows Contributing on Windows
@parent guides.Contributing

This guide will help you get set up with Steal Tools on Windows. To develop Steal Tools you need a C++ compiler (for native dependencies).

## Package Management

In this guide we'll use [chocolatey](https://chocolatey.org/) to install packages needed to develop Steal Tools. You don't have to use chocolatey if you don't want, and can instead search for the dependencies and install them with a Windows installer, but we'll use chocolately because it makes things a bit easier.

After you've installed chocolatey by following the instructions [on the homepage](https://chocolatey.org/) **open an administrative console** and proceed to the next step.

## Python 2.x

Native dependencies in Node.js are installed with [node-gyp](https://github.com/nodejs/node-gyp) which uses Python as a build tool. It expects Python 2.x:

```shell
choco install python2 -y
```

## Windows SDK

Next we need the Windows SDK. We're going to assume Windows 7, but adjust this command to the version of Windows you use:

```shell
choco install windows-sdk-7.1 -y
```

## Visual Studio Express

Installing Visual Studio Express gives us the C++ compiler we need:

```shell
choco install visualstudioexpress2013windowsdesktop -y
```
