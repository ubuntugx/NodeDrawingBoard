import numpy as np
import cv2
# import cv2.cv as cv
import sys, json
# from matplotlib import pyplot as plt

import ctypes

for line in sys.stdin:
  data = json.loads(line)
# MessageBox = ctypes.windll.user32.MessageBoxW
img = cv2.imread(data['path'])
mask = np.zeros(img.shape[:2],np.uint8)

# Mat dst
# Mat tmp,alpha

# cv2.cvtColor(img,tmp,cv.CV_BGR2GRAY)
# cv2.threshold(tmp,alpha,100,255,THRESH_BINARY)
# Mat rgb[3];
# cv2.split(src,rgb);
# Mat rgba[4]={rgb[0],rgb[1],rgb[2],alpha};
# cv2.merge(rgba,4,dst)
# cv2.imwrite("dst.png",dst)

bgdModel = np.zeros((1,65),np.float64)
fgdModel = np.zeros((1,65),np.float64)
# MessageBox(None, 'Message', 'Window title', 0)

# print data['imageFileName']

rect = (data['args'][0],data['args'][1],data['args'][2],data['args'][3])
cv2.grabCut(img,mask,rect,bgdModel,fgdModel,5,cv2.GC_INIT_WITH_RECT)

mask2 = np.where((mask==2)|(mask==0),0,1).astype('uint8')
img = img*mask2[:,:,np.newaxis]
# img += 255*(1-cv2.cvtColor(mask2, cv2.COLOR_GRAY2BGR))
img = cv2.merge((img, 255*mask2))
# print data['path']
cv2.imwrite('public/uploadImages/'+data['handleFileName'], img)
# plt.imshow(img)
# plt.colorbar()
# plt.show()
