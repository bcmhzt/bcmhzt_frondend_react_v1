import React, { useState, useEffect } from "react";
// import BackgroundImage1 from '../assets/background/bcmhzt1.webp';
// import BackgroundImage2 from '../assets/background/bcmhzt2.webp';
// import BackgroundImage3 from '../assets/background/bcmhzt3.webp';
// import BackgroundImage4 from '../assets/background/bcmhzt4.webp';
// import BackgroundImage5 from '../assets/background/bcmhzt5.webp';

/**
 * [src/components/VidualBackground.js:xx]
 * visual_background	visualBackground	VisualBackground	visual/background
 * 画像はwebpに変換する（軽量化）
 * 
 * 
 * 
 * 
 */
const VisualBackground = () => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {

    const backgroundImages = [
      '/assets/background/bcmhzt1.webp',
      '/assets/background/bcmhzt2.webp',
      '/assets/background/bcmhzt3.webp',
      '/assets/background/bcmhzt4.webp',
      '/assets/background/bcmhzt5.webp',
      '/assets/background/bcmhzt6.webp',
      '/assets/background/bcmhzt7.webp',
    ];

    const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];

    const img = new Image();
    img.src = randomImage;

    img.onload = () => {
      setBackgroundImage(randomImage);
      setIsImageLoaded(true);
    };

  }, []);

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        opacity: isImageLoaded ? 1 : 0,
        transition: 'opacity 1s ease-in-out',
       }}
      className="main-visual">
      {!isImageLoaded && (
        <p>Loading...</p> /* ローディングインジケータを表示 */
      )}
      <h2 className="main-title pt30"><span className="bgbar">BCMHZT</span></h2>
      <div className="container">
       <div className="row">
        <div className="col-lg-6 mvbg-subleft">
          {/* <!-- ここにテキストを追加 --> */}
        </div>

        <div className="col-lg-6 mvbg-subright">バクムーツ</div>
        <div className="col-lg-6 mvbg-subright2 mt50">
          ユーザーが<span className="top-text-1">自分の声</span>を発信し、<span className="top-text-2">新しいつながり</span>を築くことで、より<span className="top-text-2">多様で活発</span>な<span className="top-text-3">デジタルコミュニティ</span>を創り上げることを目指しています。
        </div> 
          
          {/* <p className="bgbar">
            <span
              style={{ fontSize:'20px', fontWeight:'bold' }}>バクムーツ</span>
              は、ユーザーが自分の声を発信し、新しいつながりを築くことで、より
            <span style={{ fontSize:'20px', fontWeight:'bold' }}>多様で活発な</span>多様で活発なデジタルコミュニティを創り上げることを目指しています。
          </p> */}
        
       </div>
      </div>
    </div>
  );
};
export default VisualBackground;
