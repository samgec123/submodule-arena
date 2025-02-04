# Steps to Include a Commons Block in Arena Repository

This document outlines the procedure for integrating a commons block into the Arena repository. It provides step-by-step instructions to ensure that the commons block is correctly included and functional within the project.

## Prerequisites

1. Add the block definition, JavaScript, and CSS in `commons/blocks`.

## Steps to Use the Block in Arena

## Steps to Use the Block in Arena

1. **Add a New Entry in `models/_component-definition.json`**:
   - Add a new entry under the `components` section in the `common-blocks` section to reference the required block.
   - Example format:
     ```json
     {
       "...": "../commons/blocks/hero/_hero.json#/definitions"
     }
     ```
   - This will include the block definition in `component-definition.json` through the pre-commit hook, making the block visible for selection in the Universal Editor (UE).

2. **Add a New Entry in `models/_component-models.json`**:
   - Add a new entry to reference the required block.
   - Example format:
     ```json
     {
       "...": "../commons/blocks/hero/_hero.json#/models"
     }
     ```

3. **Add a New Entry in `models/_component-filters.json`**:
   - Add a new entry to reference the required block.
   - Example format:
     ```json
     {
       "...": "../commons/blocks/hero/_hero.json#/filters"
     }
     ```

4. **Update `scripts/init.js`**:
   - Add the block to the `window.hlx.commonsBlocks` array in `scripts/init.js`.
   - This ensures that the relevant CSS and JavaScript for the commons block are loaded when added to the page.
   - Example:
     ```javascript
     window.hlx.commonsBlocks = ['cards', 'columns', 'fragment', 'hero'];
     ```

By following these steps, you can successfully integrate a commons block into the Arena repository.
