<div className="swapButtons"><p className={`${swapCoin === 0 && "tealActive"}`} onClick={() => setSwapCoin(0)}>PETAL</p><p className={`${swapCoin === 1 && "tealActive"}`} onClick={() => setSwapCoin(1)}>VIRTUE</p></div>
   {swapCoin === 0 && <><div className="swapButtons"><p className={`${swapState === 0 && "tealActive"}`} onClick={() => setSwapState(0)}>Buy PETAL</p><p className={`${swapState === 1 && "tealActive"}`} onClick={() => setSwapState(1)}>Sell PETAL</p>  
  <div style={{ position: 'relative', marginTop: '2px', marginLeft: '-8px' }}>
  <span style={{
    position: 'absolute',
    fontSize: '1.5rem',
    left: '110px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    %
  </span><input id="refInput" className="inputText slipBox userText outlineTeal" placeholder="Slippage" onWheel={(e) => (e.target as HTMLInputElement).blur()} onChange={(e) => setSlippage(Number(e.target.value))} value={slippage} type="number" />
    </div></div>
    {swapState === 0 ? <>
    <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    fontSize: '1.5rem',
    right: '30px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    ETH
  </span>
    <input id="refInput" className="inputBox inputText userText outlineTeal" placeholder="0 ETH" onWheel={(e) => (e.target as HTMLInputElement).blur()} onChange={(e) => setBuyValue(Number(e.target.value))} value={buyValue} type="number" />
    </div>
   <p className="rightSide">Balance: {Number(ethers.formatUnits(String(ethBalance), 18)).toFixed(4)} ETH</p>
     <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    right: '30px',
    fontSize: '1.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    PETAL
  </span>
    <input className="inputBox inputText newText outlineTeal" id="refInput" placeholder="0 PETAL" value={String(Number(buyValue / (Number(spotPrice) / 1e18)-((buyValue / (Number(spotPrice) / 1e18)/100)*3)).toFixed(4))} type="number" readOnly />
  </div>
  <p className="rightSide">Balance: {Number(ethers.formatUnits(String(petalBalance), 18)).toFixed(2)} PETAL</p>
    {buyValue > 0 ? <><p onClick={() => petalLaunched ? buyEth(Data.petalToken as Address, spotPrice as number) : buyToken()} className="enterButton pointer">Buy</p>
    </>:<></>}<p style={{textAlign: 'center'}}>1 ETH = {Number(1/Number(Number(spotPrice) / 10 ** 18)).toFixed(4)} PETAL</p>
    <p style={{textAlign: 'center'}}>3% Tax</p>
    {!petalLaunched && <><p style={{textAlign: 'center'}}>ETH To Bond: {Number(ethers.formatUnits(String(ethIn), 18)).toFixed(3)} / 40 ETH</p></>}
    </>:
    <>
      <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    fontSize: '1.5rem',
    right: '30px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    PETAL
  </span>
    <input id="refInput" className="inputBox inputText userText outlineTeal" placeholder="0 PETAL" onWheel={(e) => (e.target as HTMLInputElement).blur()} onChange={(e) => setSellValue(Number(e.target.value))} value={sellValue} type="number" />
    </div>
    <p className="rightSide">Balance: {Number(ethers.formatUnits(String(petalBalance), 18)).toFixed(2)} PETAL</p>
      <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    right: '30px',
    fontSize: '1.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    ETH
  </span>
    <input className="inputBox inputText newText outlineTeal" id="refInput" placeholder="0 ETH" value={String(Number(sellValue * (Number(spotPrice) / 1e18)-((sellValue * (Number(spotPrice) / 1e18)/100)*3)).toFixed(8))} type="number" readOnly />
    </div>
    <p className="rightSide">Balance: {Number(ethers.formatUnits(String(ethBalance), 18)).toFixed(4)} ETH</p>
    {sellValue > 0 ? <>
    {sellValue*10**18 > petalAllowance ? <><p onClick={() => petalLaunched ? approveRouter(Data.petalToken as Address) : approveToken()} className="enterButton pointer">Approve</p></>:<><p onClick={() => petalLaunched ? sellEth(Data.petalToken as Address, spotPrice as number) : sellToken()} className="enterButton pointer">Sell</p></>}</>:<></>}
      <p style={{textAlign: 'center'}}>1 PETAL = {Number(Number(spotPrice) / 10 ** 18).toFixed(10)} ETH</p>
      <p style={{textAlign: 'center'}}>3% Tax</p>
      {!petalLaunched && <><p style={{textAlign: 'center'}}>ETH To Bond: {Number(ethers.formatUnits(String(ethIn), 18)).toFixed(3)} / 40 ETH</p></>}
      </>}</>}
    {swapCoin === 1 && <><div className="swapButtons"><p className={`${swapState === 0 && "tealActive"}`} onClick={() => setSwapState(0)}>Buy VIRTUE</p><p className={`${swapState === 1 && "tealActive"}`} onClick={() => setSwapState(1)}>Sell VIRTUE</p>  
  <div style={{ position: 'relative', marginTop: '2px', marginLeft: '-8px' }}>
  <span style={{
    position: 'absolute',
    fontSize: '1.5rem',
    left: '110px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    %
  </span><input id="refInput" className="inputText slipBox userText outlineTeal" placeholder="Slippage" onWheel={(e) => (e.target as HTMLInputElement).blur()} onChange={(e) => setSlippage(Number(e.target.value))} value={slippage} type="number" />
    </div></div>
    {swapState === 0 ? <>
    <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    fontSize: '1.5rem',
    right: '30px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    ETH
  </span>
    <input id="refInput" className="inputBox inputText userText outlineTeal" placeholder="0 ETH" onWheel={(e) => (e.target as HTMLInputElement).blur()} onChange={(e) => setBuyValue(Number(e.target.value))} value={buyValue} type="number" />
    </div>
   <p className="rightSide">Balance: {Number(ethers.formatUnits(String(ethBalance), 18)).toFixed(4)} ETH</p>
     <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    right: '30px',
    fontSize: '1.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    VIRTUE
  </span>
    <input className="inputBox inputText newText outlineTeal" id="refInput" placeholder="0 VIRTUE" value={String(Number(buyValue / (Number(virtuePrice) / 1e18)-((buyValue / (Number(virtuePrice) / 1e18)/100)*3)).toFixed(4))} type="number" readOnly />
  </div>
  <p className="rightSide">Balance: {Number(ethers.formatUnits(String(virtueBalance), 18)).toFixed(2)} VIRTUE</p>
    {buyValue > 0 ? <><p onClick={() => virtueLaunched ? buyEth(Data.virtueToken as Address, virtuePrice as number) : buyVirtue()} className="enterButton pointer">Buy</p>
    </>:<></>}<p style={{textAlign: 'center'}}>1 ETH = {Number(1/Number(Number(virtuePrice) / 10 ** 18)).toFixed(4)} VIRTUE</p>
    <p style={{textAlign: 'center'}}>3% Tax</p>
    {!virtueLaunched && <><p style={{textAlign: 'center'}}>ETH To Bond: {Number(ethers.formatUnits(String(virtueIn), 18)).toFixed(3)} / 4 ETH</p></>}
    </>:
    <>
      <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    fontSize: '1.5rem',
    right: '30px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    VIRTUE
  </span>
    <input id="refInput" className="inputBox inputText userText outlineTeal" placeholder="0 VIRTUE" onWheel={(e) => (e.target as HTMLInputElement).blur()} onChange={(e) => setSellValue(Number(e.target.value))} value={sellValue} type="number" />
    </div>
    <p className="rightSide">Balance: {Number(ethers.formatUnits(String(virtueBalance), 18)).toFixed(2)} VIRTUE</p>
      <div style={{ position: 'relative' }}>
  <span className="inputAfter" style={{
    position: 'absolute',
    right: '30px',
    fontSize: '1.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFF'
  }}>
    ETH
  </span>
    <input className="inputBox inputText newText outlineTeal" id="refInput" placeholder="0 ETH" value={String(Number(sellValue * (Number(virtuePrice) / 1e18)-((sellValue * (Number(virtuePrice) / 1e18)/100)*3)).toFixed(8))} type="number" readOnly />
    </div>
    <p className="rightSide">Balance: {Number(ethers.formatUnits(String(ethBalance), 18)).toFixed(4)} ETH</p>
    {sellValue > 0 ? <>
    {sellValue*10**18 > virtueAllowance ? <><p onClick={() => virtueLaunched ? approveRouter(Data.virtueToken as Address) : approveVirtue()} className="enterButton pointer">Approve</p></>:<><p onClick={() => virtueLaunched ? sellEth(Data.virtueToken as Address, virtuePrice as number) : sellVirtue()} className="enterButton pointer">Sell</p></>}</>:<></>}
      <p style={{textAlign: 'center'}}>1 VIRTUE = {Number(Number(virtuePrice) / 10 ** 18).toFixed(10)} ETH</p>
      <p style={{textAlign: 'center'}}>3% Tax</p>
      {!virtueLaunched && <><p style={{textAlign: 'center'}}>ETH To Bond: {Number(ethers.formatUnits(String(virtueIn), 18)).toFixed(3)} / 4 ETH</p></>}
      </>}</>}