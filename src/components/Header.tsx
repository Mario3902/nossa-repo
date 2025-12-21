import React from 'react'
import styles from './Header.module.css'
import logo from '../assets/logo_img.png'
import { MessageCircleQuestionMark } from 'lucide-react'

const Header = ({modulo}:{modulo: String}) => {
  return (
    <header className={styles.header}>
        <img src={logo} alt="" />
        <div style={{fontWeight:"100"}}>{modulo}</div>
        <div style={{display: "flex", flexDirection:"row", alignItems:"center", justifyContent:"center", gap:"6px", background:"#0A3057", borderRadius:"12px", padding:"0 6px"}}>
            <MessageCircleQuestionMark size={12} color='red'/>
            <p style={{fontSize:"12px"}}>Ajuda</p>
        </div>
    </header>
  )
}

export default Header
