import styles from '../styles/PlaylistDetails.module.css'
import { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

export default function PlaylistDetails({ submit, newForm=false, button=false, icon=false, openTrigger=null, defaultName='', defaultDesc='', defaultIsPublic=false, playlistId='' }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  useEffect(() => {
    setName(defaultName)
    setDescription(defaultDesc)
    setIsPublic(defaultIsPublic)
  }, [open])

  useEffect(() => {
    if (openTrigger == null) return
    setOpen(openTrigger)
  }, [openTrigger])

  const handleClickOpen = (e) => {
    if (!e) e = window.event
    e.cancelBubble = true
    if (e.stopPropagation) e.stopPropagation()

    setOpen(true)
  }

  const handleClose = (e) => {
    if (!e) e = window.event
    e.cancelBubble = true
    if (e.stopPropagation) e.stopPropagation()

    setOpen(false)
  }

  const handleSubmit = (e) => {
    if (!e) e = window.event
    e.cancelBubble = true
    if (e.stopPropagation) e.stopPropagation()
    if (!name) return

    let info = {
      name: name,
      description: description,
      isPublic: isPublic
    }
    if (playlistId) info.playlistId = playlistId
    submit(info)
    setOpen(false)
  }

  const handleNameChange = (e) => {
    setName(e.target.value)
  }

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value)
  }

  const handlePrivateChange = () => {
    setIsPublic(!isPublic)
  }

  return (
    <div>
      {button &&
        <Button className={styles.button} variant="outlined" color="primary" onClick={handleClickOpen}>
          {newForm ? 'New' : 'Edit'} Playlist
        </Button>  
      }
      {icon &&
        <i 
          className="material-icons"
          onClick={handleClickOpen}
        >edit</i>
      }
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" className={styles.dialog}>
        <DialogTitle id="form-dialog-title" className={styles.title}>{newForm ? 'New' : 'Edit'} Playlist</DialogTitle>
        <DialogContent className={styles.content}>
          <DialogContentText>
            {newForm && 'Please enter a name and optional description for your new playlist.'}
            {!newForm && 'Update playlist details. Name is required.'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="playlistName"
            label="Playlist Name (required)"
            type="text"
            value={name}
            onChange={handleNameChange}
            inputProps={{ maxLength: 50 }}
            autoComplete='off'
            fullWidth
          />
          <TextField
            margin="dense"
            id="description"
            label="Description (optional)"
            type="type"
            value={description}
            onChange={handleDescriptionChange}
            inputProps={{ maxLength: 200 }}
            autoComplete='off'
            multiline
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!isPublic}
                onChange={handlePrivateChange}
                name="private"
                color="primary"
              />
            }
            label="Private Playlist"
          />
        </DialogContent>
        <DialogActions className={styles.actions}>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {newForm ? 'Create' : 'Edit'} Playlist
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}