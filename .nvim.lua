local nvim_tree_api = require("nvim-tree.api")
require("nvim-tree").setup({
  filters = {
    custom = {
      "^.git$",
      "node_modules",
      ".nx",
      ".vscode",
      "apps/.*-e2e",
      "apps/workers",
    },
  },
})
nvim_tree_api.tree.reload()

local telescope = require("telescope")
telescope.setup({
  defaults = {
    file_ignore_patterns = {
      "node_modules/",
      "%.nx/",
      ".vscode/",
      "apps/.*%-e2e/", -- Note: Telescope uses Lua patterns, '%' escapes the '-'
      "apps/workers/",
    },
  },
})

print("✨ Nx Project Profile Loaded: e2e and workers hidden")
