
import styles from './styles.module.css'

export function ComicCard() {
  return (
    <div style={{
      padding: '20px 25px',
      width: '100%',
      maxWidth: '450px',
      height: '140px',
      borderRadius: '10px',
      marginBottom: '19px',
      color: '#fff',
    }} className={styles.comicCard}>
      <h2>Doraemon</h2>
      <span style={{
        color: '#A7ACC0'
      }}>This is a decription</span>
      <div style={{
        display: 'flex'
      }}>
        <div style={{
          width: '100%',
        }}></div>
        <button style={{
          background: '#292B33',
          color: '#BBC1D6',
          padding: '5px 15px',
          borderRadius: '8px'
        }} className={'border-[#434754] border-solid border-[1px] hover:border-[#2F4DEE]'}>Read</button> 
      </div>
      
    </div>
  )
}
