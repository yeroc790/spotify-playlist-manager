import styles from '../styles/NewPlaylist.module.css'
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

export default function NewPlaylist({ addPlaylist }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  useEffect(() => {
    if (open) return
    setName('')
    setDescription('')
    setIsPrivate(false)
  }, [open])

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const createPlaylist = () => {
    if (!name) return
    let info = {
      name: name,
      description: description,
      isPrivate: isPrivate
    }
    addPlaylist(info)
    setOpen(false)
  }

  const handleNameChange = (e) => {
    setName(e.target.value)
  }

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value)
  }

  const handlePrivateChange = () => {
    setIsPrivate(!isPrivate)
  }

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        New Playlist
      </Button>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" className={styles.dialog}>
        <DialogTitle id="form-dialog-title" className={styles.title}>New Playlist</DialogTitle>
        <DialogContent className={styles.content}>
          <DialogContentText>
            Please enter a name and optional description for your new playlist.
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
                checked={isPrivate}
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
          <Button onClick={createPlaylist} color="primary">
            Create Playlist
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}