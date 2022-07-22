import mongoose from 'mongoose'
import PostMessage from '../models/postMessage.js'

export const getPosts = async (req, res) => {
  const { page } = req.query

  try {
    const LIMIT = 6
    const startIndex = (+page - 1) * LIMIT
    const total = await PostMessage.countDocuments({})

    const posts = await PostMessage.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex)

    res.status(200).json({
      data: posts,
      currentPage: +page,
      numberOfPages: Math.ceil(total / LIMIT),
    })
  } catch (error) {
    res.status(404).json({ message: error })
  }
}

export const getPost = async (req, res) => {
  const { id } = req.params

  try {
    const post = await PostMessage.findById(id)

    res.status(200).json(post)
  } catch (error) {
    res.status(404).json({ message: error })
  }
}

export const getPostsBySearch = async (req, res) => {
  const { searchQuery, tags } = req.query
  try {
    const title = new RegExp(searchQuery, 'i')
    const postMessages = await PostMessage.find({
      $or: [{ title }, { tags: { $in: tags.split(',') } }],
    })

    res.status(200).json({ data: postMessages })
  } catch (error) {
    res.status(404).json({ message: error })
  }
}

export const createPost = async (req, res) => {
  const post = req.body

  const newPost = new PostMessage({
    ...post,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  })

  try {
    await newPost.save()

    res.status(201).json(newPost)
  } catch (error) {
    res.status(409).json({ message: error })
  }
}

export const updatePost = async (req, res) => {
  const { id: _id } = req.params
  const post = req.body

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send('No post with that id!')

  try {
    const updatedPost = await PostMessage.findByIdAndUpdate(
      _id,
      { ...post, _id },
      {
        new: true,
      }
    )

    res.status(200).json(updatedPost)
  } catch (error) {
    //FIXME: check this after, be sure for correct status code returned
    res.status(409).json({ message: error })
  }
}

export const deletePost = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send('No post with that id!')

  try {
    await PostMessage.findByIdAndRemove(id)

    res.status(204).json({ message: 'Post deleted successfully!' })
  } catch (error) {
    //FIXME: check this after, be sure for correct status code returned
    res.status(409).json({ message: error })
  }
}

export const likePost = async (req, res) => {
  const { id } = req.params

  if (!req.userId) return res.status(401).json({ message: 'Unauthenticated' })

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send('No post with that id!')

  const post = await PostMessage.findById(id)

  const index = post.likes.findIndex((id) => id === String(req.userId))

  if (index === -1) {
    // like the post
    post.likes.push(req.userId)
  } else {
    // unlike the post
    post.likes = post.likes.filter((id) => id !== String(req.userId))
  }
  if (!post) return res.status(404).json({ message: 'Post not found!' })

  try {
    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
      new: true,
    })
    res.status(200).json(updatedPost)
  } catch (error) {
    //FIXME: check this after, be sure for correct status code returneds
    return res.status(409).json({ message: error })
  }
}

export const commentPost = async (req, res) => {
  const { id } = req.params
  const { value } = req.body

  try {
    const post = await PostMessage.findById(id)

    post.comments.push(value)

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
      new: true,
    })

    res.status(200).json(updatedPost)
  } catch (error) {
    //FIXME: check this after, be sure for correct status code returneds
    return res.status(409).json({ message: error })
  }
}
