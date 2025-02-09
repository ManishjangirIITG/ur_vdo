import React from 'react'
import Showvideo from "../Showvideo/Showvideo"
import vid from "../Video/vid.mp4"
import { useSelector } from 'react-redux'
const Showvideolist = ({ videoid }) => {
  const vids = useSelector(state => state.videoreducer)
  console.log(videoid)
  return (
    <div className="Container_ShowVideoGrid">
      {
        vids?.data.filter(q => q._id === videoid).map(vi => {
          return (
            <div className="video_box_app" key={vi._id}>
              <Showvideo vid={vi} />
            </div>
          )
        })
      }
    </div>
  )
}

export default Showvideolist