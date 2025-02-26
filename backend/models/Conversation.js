const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const conversationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        title: {
            type: String,
            required: true
        },
        content: { // Only used if a conversation is smaller than a certain size
            type: [[String]],
            default: [],
            required: false
        },
        compressed_content: {
            type: String,
            default: '',
            required: false
        },
        respond: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    {
        timestamps: true
    }
)

conversationSchema.plugin(AutoIncrement, {
    inc_field: 'counter',
    id: 'conversation_counter',
    start_seq: 1
})

module.exports = mongoose.model('Conversation', conversationSchema)