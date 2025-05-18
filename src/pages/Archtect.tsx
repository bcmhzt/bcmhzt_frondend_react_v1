import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log("[src/pages/Archtect.tsx:xx] debug:", debug);
}

/**
 * 99999999 (hash)
 * [src/pages/Archtect.tsx:xx]
 * 
 * type: page | component | hook | context ...
 * 
 * [Order] このコードでやっていること
 * - 各Componentの雛形
 */

const Archtect = () => {
  return (
    <div className="app-body">

      <Header />
      <div className="container bc-app">
        <div className="row">

          <div className="col-sm-12 col-md-6 col-lg-6 bc-left">

            <div className="section mb20">
              <h2 className="">あなたにナイスすけべをした人</h2>
            </div>

            <h2 className="">あなたにナイスすけべをした人</h2>
            <p className="open-sans">The iMac G4 is an <Link to="/">all-in-one personal</Link> computer produced by Apple Computer from January 2002 to August 2004. It comprises a hemispheric base that holds the computer components and a flatscreen liquid-crystal display (LCD) mounted above. The iMac G3, first released in 1998, helped save Apple from bankruptcy. Development of the iMac G4 took roughly two years, with Apple's designers exploring multiple ways of marrying the display screen with the computer components. Its shape was inspired by a sunflower, with the display connected to the base via an adjustable stainless-steel arm that allows the monitor to be freely tilted and swiveled. The product was a critical and commercial success for Apple, selling more than 1.3 million units in its first year, and it was updated with faster components and larger displays before being replaced by the iMac G5 in September 2004. The machine is held in the collections of multiple museums, including the Museum of Modern Art and Museums Victoria. (Full article...)</p>
            <p className="open-sans">　神戸外国人居留地は、安政五カ国条約に基づき、1868年1月1日（慶応3年12月7日）から1899年（明治32年）7月16日までの間、兵庫津の約3.5km東に位置する神戸村（後の兵庫県神戸市中央区）に設けられた外国人居留地である。<br />　神戸居留地ともいう。東を（旧）生田川（後のフラワーロード）、西を鯉川（後の鯉川筋）、南を海、北を西国街道（後の花時計線）に囲まれた広さ約7万8000坪の区域が合理的な都市計画に基づいて開発され、「東洋における居留地としてもっともよく設計されている」と評された。一定の行政権・財政権などの治外法権が認められ、居留外国人を中心に組織された自治機構によって運営された。運営は円滑に行われ、日本側と外国側との関係も概ね良好であったと評価されている。貿易の拠点、西洋文化の入り口として栄え、周辺地域に経済的・文化的影響を与えた。<br />　神戸外国人居留地は、安政五カ国条約に基づき、1868年1月1日（慶応3年12月7日）から1899年（明治32年）7月16日までの間、兵庫津の約3.5km東に位置する神戸村（後の兵庫県神戸市中央区）に設けられた外国人居留地である。<br />　神戸居留地ともいう。東を（旧）生田川（後のフラワーロード）、西を鯉川（後の鯉川筋）、南を海、北を西国街道（後の花時計線）に囲まれた広さ約7万8000坪の区域が合理的な都市計画に基づいて開発され、「東洋における居留地としてもっともよく設計されている」と評された。一定の行政権・財政権などの治外法権が認められ、居留外国人を中心に組織された自治機構によって運営された。運営は円滑に行われ、日本側と外国側との関係も概ね良好であったと評価されている。貿易の拠点、西洋文化の入り口として栄え、周辺地域に経済的・文化的影響を与えた。</p>
          </div>

            <div className="d-none d-md-block col-md-6 col-lg-6 bc-right">
              bar
            </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Archtect;