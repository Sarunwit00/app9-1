/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react'
import './table-style.css'
import './paginate-style.css'

export default function DBPaginate() {
    let [data, setData] = React.useState('')
    let [page, setPage] = React.useState([])

    React.useEffect(() => {
        // อ่าน Query String ที่ปรากฏบน URL ของบราวเซอร์ในขณะนั้น
        let qStr = window.location.search
        let params = new URLSearchParams(qStr)

        // นำค่า Query String ไปต่อท้าย URL เป้าหมายของฝั่งเซิร์ฟเวอร์
        fetch('/api/db/paginate?' + params)
            .then(response => response.json())
            .then(result => {
                if (result.totalDocs > 0) {   // หากมีข้อมูลผลลัพธ์
                    showData(result.docs)      // แสดงรายการข้อมูล
                    showPages(result)          // แสดงหมายเลขเพจ
                } else {
                    setData(<>ไม่มีรายการข้อมูล</>)
                }
            })
            .catch(err => alert(err))
    }, [])

    // ฟังก์ชันสำหรับแสดงรายการข้อมูล แล้วเปลี่ยนค่าใน State
    const showData = (result) => {
        let tb = (
            <table>
                <tr>
                    <th class="thLeft">ชื่อสินค้า</th>
                    <th>ราคา</th>
                    <th>วันที่เพิ่มสินค้า</th>
                    <th class="thLeft">รายละเอียด</th>
                </tr>
                {
                    result.map(doc => {
                        // จัดรูปแบบวันเดือนปี ที่สามารถเข้าใจได้
                        let dt = new Date(Date.parse(doc.date_added))
                        let df = (
                            <>{dt.getDate()}-{(dt.getMonth() + 1)}-{dt.getFullYear()}</>
                        )
                        let p = new Intl.NumberFormat().format(doc.price)
                        return (
                            <tr key={doc._id}>
                                <td>{doc.name}</td>
                                <td class="tdCenter">{p}</td>
                                <td class="tdCenter">{df}</td>
                                <td>{doc.detail}</td>
                            </tr>
                        )
                    })
                }
            </table>
        )
        setData(tb)
    }

    // ฟังก์ชันสำหรับสร้างหมายเลขเพจ แล้วเปลี่ยนค่าใน state
    const showPages = (result) => {
        let links = []   // เพื่อความสะดวก เราจะเก็บลิงก์ของแต่ละเพจไว้ในอาร์เรย์

        // วนลูปตามจำนวนหมายเลขเพจทั้งหมดที่มี
        for (let i = 1; i <= result.totalPages; i++) {
            if (i === result.page) {
                // เพจปัจจุบันไม่ให้คลิกซ้ำ
                links.push(<span class="page-active">{i}</span>)
            } else {
                // กำหนดลิงก์ด้วยหมายเลขเพจ โดยกำหนดพารามิเตอร์แบบ Query String
                // แล้วต่อเข้ากับ URL ของฝั่งโลคอลหรือของแอปในแฟ้มนี้นั่นเอง
                let a = (
                    <a href={'/db/paginate?page=' + i} class="page">{i}</a>
                )
                links.push(a)
            }
        }
        setPage(links)   // เปลี่ยนค่าใน State
    }

    return (
        <div style={{ margin: '20px' }}>
            <div id="data">{data}</div><br />

            {/* เนื่องจากหมายเลขเพจทั้งหมดเก็บไว้ใน page (อยู่ใน State)
                ดังนั้น เมื่อมีการอัปเดตค่าของเพจ ระบบก็จะรีเฟรช */}
            <div>{page.map(p => (<>{p} </>))}</div><br />

            <a href="/db">หน้าหลัก</a>
        </div>
    )
}
