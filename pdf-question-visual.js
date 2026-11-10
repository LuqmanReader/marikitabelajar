/* Original visual question evidence cropped from a rendered PDF page.
 * Layout coordinates originate at 1.7x; reproject into the actual render scale.
 * This never infers student answers from the crop; it preserves original pixels.
 */
(function(root){
'use strict';
function cropRect(region,width,height,renderScale,layoutScale){
  if(!region||!Number.isFinite(region.x)||!Number.isFinite(region.y)||
     !Number.isFinite(region.w)||!Number.isFinite(region.h)||
     !Number.isFinite(width)||!Number.isFinite(height))return null;
  var ratio=(Number(renderScale)||1.7)/(Number(layoutScale)||1.7);
  var pad=12, x=Math.max(0,Math.floor(region.x*ratio-pad)),
      y=Math.max(0,Math.floor(region.y*ratio-pad));
  var right=Math.min(width,Math.ceil((region.x+region.w)*ratio+pad)),
      bottom=Math.min(height,Math.ceil((region.y+region.h)*ratio+pad));
  if(right<=x||bottom<=y||right-x<35||bottom-y<22)return null;
  return {x:x,y:y,w:right-x,h:bottom-y};
}
function crop(canvas,region,renderScale){
  if(!root.document||!root.document.createElement||!canvas)return null;
  var r=cropRect(region,canvas.width,canvas.height,renderScale,1.7);
  if(!r)return null;
  var out=root.document.createElement('canvas');
  out.width=r.w;out.height=r.h;
  var ctx=out.getContext('2d',{alpha:false});
  if(!ctx||!out.toDataURL)return null;
  ctx.drawImage(canvas,r.x,r.y,r.w,r.h,0,0,r.w,r.h);
  var result=out.toDataURL('image/jpeg',0.83);
  out.width=0;out.height=0;
  return result;
}
root.LedgerPeerPdfVisual={cropRect:cropRect,crop:crop};
})(window);