/** 0b16db48 */
import React, { useState, useEffect } from "react";
// import BackgroundImage1 from '../assets/background/bcmhzt1.webp';
// import BackgroundImage2 from '../assets/background/bcmhzt2.webp';
// import BackgroundImage3 from '../assets/background/bcmhzt3.webp';
// import BackgroundImage4 from '../assets/background/bcmhzt4.webp';
// import BackgroundImage5 from '../assets/background/bcmhzt5.webp';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log("[src/components/VidualBackground.tsx:xx] debug:", debug);
}

/**
 * 0b16db48 (hash)
 * [src/components/VidualBackground.tsx:xx]
 * 
 * type: page | component | hook | context ...
 * 
 * [Order]
 * - メインビジュアル背景
 * - 画像はランダムに表示する
 * - ローディングインジケータを表示
 * - タイトルとサブタイトルを表示
 * - タイトルは背景に重ねて表示
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
       </div>
      </div>
    </div>
  );
};
export default VisualBackground;
