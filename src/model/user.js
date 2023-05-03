const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    username:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        validate(value)
        {
            if(!validator.isEmail(value))
            {
                throw new Error('Invalid email')
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim:true,
        minlength:7,
        validate(value)
        {
            if(value.toLowerCase().includes('password'))
            {
                throw new Error("Password can not contain the word 'password'")
            }
        }
    },
    address:{
        type: String,
        trim: true
    },
    phone:{
        type: String,
        trim: true
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]
},{
    timestamps: true
})

userSchema.virtual('todos', {
    ref: 'Todo',
    localField: '_id',
    foreignField: 'userId'
})

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.tokens
    delete userObject.password

    return userObject
}

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_TOKEN)

    user.tokens = user.tokens.concat({token})

    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email,password) =>{
    const user = await User.findOne({email})

    if(!user)
    {
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    
    if(!isMatch)
    {
        throw new Error('Unable to login')
    }
    return user
}

userSchema.pre('save', async function (next){
    const user = this

    if(user.isModified("password")){
        user.password = await bcrypt.hash(user.password, 8)
    }
    
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User