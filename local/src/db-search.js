/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react'
import './paginate-style.css'

export default function DBSearch() {
  let [data, setData] = React.useState('')
  let [page, setPage] = React.useState([])

  //อ่านคีย์เวิร์ดจาก URL
  let qStr = window.location.search
  let params = new URLSearchParams(qStr)

  React.useEffect(() => {
    fetch('/api/db/search?' + params)
      .then(response => response.json())
      .then(result => {
        showData(result)
        paginate(result)
      })
      .catch(err => alert(err))
  }, [])

  const showData = (result) => {
    const numDocs = result.totalDocs
    const hidden = {
      visibility: 'hidden'
    }

    let r = (
      <div style={{maxWidth: '800px'}}>
        <span class="float-start mt-2">
          {
            (numDocs === 0)
              ? <>ไม่พบข้อมูล</>
              : <>พบข้อมูลทั้งหมด {result.totalDocs} รายการ</>
          }
        </span>

        {/* แสดงฟอร์ม เพื่อรับคีย์เวิร์ดสำหรับการค้นหา */}
        <form action="/db/search" method="get" class="mb-2 float-end">
          <div class="d-inline-block">
            <input type="text" name="q" defaultValue={params.get('q')}
              class="form-control form-control-sm"/>
          </div>&nbsp;
          <button class="btn btn-sm btn-primary">ค้นหา</button>
        </form>

        <table class="table table-sm table-striped caption-top" style={{maxWidth: '800px'}}>
          <thead class="table-dark">
            <tr style={(numDocs === 0) ? hidden : null}>
              <th>ชื่อสินค้า</th><th class="text-center">ราคา</th>
              <th class="text-center">วันที่เพิ่มสินค้า</th><th>รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {
              result.docs.map(doc => {
                //จัดรูปแบบวันเดือนปี ที่สามารถเข้าใจได้
                let dt = new Date(Date.parse(doc.date_added))
                let df = (
                  <>{dt.getDate()}-{dt.getMonth()+1}-{dt.getFullYear()}</>
                )
                let p = new Intl.NumberFormat().format(doc.price)

                return (
                  <tr key={doc._id}>
                    <td>{doc.name}</td>
                    <td class="text-center">{p}</td>
                    <td class="text-center">{df}</td>
                    <td>{doc.detail}</td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    )

    setData(r)
  }

  const paginate = (result) => {
    if (result.totalPages === 1) {
      setPage([])
      return
    }

    let links = []
    let q = params.get('q') || ''
    let url = `/db/search?q=${q}&page=`

    //ให้แสดง 2 หมายเลขก่อนเพจปัจจุบัน แต่ต้องไม่ต่ำกว่า 1
    let start = result.page - 2
    start = (start < 1) ? 1 : start

    //ถัดจากเพจปัจจุบัน ให้แสดงอีก 2 หมายเลข (ต้องไม่เกินจำนวนเพจทั้งหมด)
    let end = result.page + 2
    end = (end < result.totalPages) ? end : result.totalPages

    //ลิงก์ไปหน้าแรก '|<'
    if (start > 1) {
      links.push(
        <li class="page-item" key="first">
          <a href={url + 1} class="page-link">{'|<'}</a>
        </li>
      )
    }

    for (let i = start; i <= end; i++) {
      if (i === result.page) {
        links.push(
          <li class="page-item" key={i}>
            <a class="page-link active text-danger">{i}</a>
          </li>
        )
      } else {
        links.push(
          <li class="page-item" key={i}>
            <a href={url + i} class="page-link">{i}</a>
          </li>
        )
      }
    }

    //ลิงก์ไปหน้าสุดท้าย '>|'
    if (end < result.totalPages) {
      links.push(
        <li class="page-item" key="last">
          <a href={url + result.totalPages} class="page-link">{'>|'}</a>
        </li>
      )
    }

    setPage(links)
  }

  return (
    <div style={{margin:'20px'}}>
      <div>{data}</div><br/>
      <div>
        <ul class="pagination">
          {page.map(p => <>{p}</>)}
        </ul>
      </div>
      <br/>
      <a href="/db">หน้าหลัก</a>
    </div>
  )
}
