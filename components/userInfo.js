import React from 'react'
import styles from '../styles/UserInfo.module.css'
import { signOut } from 'next-auth/client'

export default class UserInfo extends React.Component {
  handleLogout(e) {
    console.log('handling logout')
    e.preventDefault()
    signOut()
  }

  render() {
    return (
      <div>
        {this.props.name &&
          <p>Logged in as {this.props.name} | <a className={styles.logout} onClick={this.handleLogout}>Logout</a></p>
        }
      </div>
    )
  }
}