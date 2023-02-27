'use strict'
const falso = require('@ngneat/falso')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let posts = [...Array(5)].map((_) => ({
      title: falso.randTextRange({ min: 10, max: 100 }),
      body: falso.randParagraph(),
      image: falso.randImg(),
      createdAt: falso.randPastDate(),
      updatedAt: falso.randRecentDate(),
    }))
    await queryInterface.bulkInsert('posts', posts)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('posts')
  }
}
