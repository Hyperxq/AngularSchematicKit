# Angular Schematics Kit Documentation

Welcome to the Angular Schematic Kit npm library! This is your go-to resource for simple, yet incredibly powerful
schematics, expertly designed to transform your Angular project setup process into a smooth sail. We understand that
initiating a new project often means retracing the same steps, which can be quite time-consuming. That's exactly why
each schematic in this library is geared towards automating and customizing configurations to align perfectly with your
project's specific needs. But it doesn't stop there! This library thrives on evolution and growth, so your contributions
towards enhancing existing schematics or creating new ones are more than welcome. Dive in, enjoy the simplicity and
power of our library, and remember—happy coding! 🎉

## How to use this schematics' package

<code>ng add @danils/schematicskit</code>

When you have already installed, the pattern to execute any schematics is:
<code>ng g @danils/schematicskit:[schematic-name]</code>

* [Angular Schematics Kit Documentation](#angular-schematics-kit-documentation)
    * [How to use this schematics' package](#how-to-use-this-schematics-package)
    * [Initialize angular configuration schematic](#initialize-angular-configuration-schematic)
        * [Problem to solve?](#problem-to-solve)
    * [Add Linters schematic](#add-linters-schematic)
        * [Problem to solve?](#problem-to-solve-1)
    * [Add GitHooks schematic](#add-githooks-schematic)

## Initialize angular configuration schematic

<code>ng g @danils/schematicskit:initialize-angular-configuration</code> or
<code>ng g @danils/schematicskit:start</code>

### Problem to solve?

Upon reviewing the documentation, you might desire a schematic that can execute all other schematics included in this
kit. For such instances, this specific schematic has been designed to fulfill that purpose.

## Add Linters schematic

<code>ng g @danils/schematicskit:add-linters</code> or <code>ng g @danils/schematicskit:l</code>

### Problem to solve?

If you work on a team, you need to make the code standards for this reason formatters and linters are needed.
This schematic allows you to immediately configure Prettier and EsLint to your project.

## Add GitHooks schematic

<code>ng g @danils/schematicskit:add-git-hooks</code> or <code>ng g @danils/schematicskit:gh</code>

This schematic allows you to install husky and set all the configuration needed.
