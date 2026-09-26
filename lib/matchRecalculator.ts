/**
 * Utility to recalculate match compatibility scores
 * Separated to avoid circular dependencies
 */
export const matchRecalculator = {
  /**
   * Recalculate all matches for a specific user
   */
  async recalculateUserMatches(userId: string): Promise<void> {
    try {
      // Dynamic import to avoid circular dependency
      const { matchService } = await import('./firestore/matches')
      const userMatches = await matchService.getUserMatches(userId)
      
      for (const match of userMatches) {
        await matchService.recalculateCompatibility(match.id)
      }
    } catch (error) {
      console.error('Error recalculating user matches:', error)
    }
  },

  /**
   * Recalculate a specific match
   */
  async recalculateMatch(matchId: string): Promise<void> {
    try {
      // Dynamic import to avoid circular dependency
      const { matchService } = await import('./firestore/matches')
      await matchService.recalculateCompatibility(matchId)
    } catch (error) {
      console.error('Error recalculating match:', error)
    }
  },

  /**
   * Update user profile and recalculate their matches
   */
  async updateUserAndRecalculateMatches(userId: string, userData: any): Promise<void> {
    try {
      // Dynamic import to avoid circular dependency
      const { userService } = await import('./firestore/users')
      await userService.updateUser(userId, userData)
      await this.recalculateUserMatches(userId)
    } catch (error) {
      console.error('Error updating user and recalculating matches:', error)
    }
  }
}
