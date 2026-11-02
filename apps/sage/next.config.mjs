import { withPathfinder } from '@pathfinder/config/next'
import nextra from 'nextra'

const withNextra = nextra({
  search: {
    codeblocks: false
  }
})

export default withNextra(withPathfinder())
