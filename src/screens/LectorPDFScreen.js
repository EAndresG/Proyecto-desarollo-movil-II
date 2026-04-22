import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  Animated,
  Linking,
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import { useLibros } from '../context/LibrosContext';

const PLACEHOLDER_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body { margin: 0; padding: 0; background: #ffffff; }
    #wrap { display: flex; align-items: center; justify-content: center; height: 100vh; color: #6b7280; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; }
  </style>
</head>
<body>
  <div id="wrap">Cargando PDF...</div>
</body>
</html>`;

export default function LectorPDFScreen({ route, navigation }) {
  const { libroId } = route.params ?? {};
  const { libros, lastPageById, setLastPage, updateLibro } = useLibros();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const libro = useMemo(
    () => libros.find((item) => item.id === libroId),
    [libroId, libros]
  );

  const [page, setPage] = useState(() => lastPageById[libroId] || 1);
  const [pageCount, setPageCount] = useState(0);
  const [inputPage, setInputPage] = useState(String(page));
  const [scale, setScale] = useState(1);
  const [htmlContent, setHtmlContent] = useState(PLACEHOLDER_HTML);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [webReady, setWebReady] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const webRef = useRef(null);
  const dragStartRatio = useRef(0);
  const initialPageRef = useRef(page);

  const extension = libro?.rutaArchivo?.split('?')[0].split('.').pop()?.toLowerCase();
  const isEpub = extension === 'epub';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (libro?.titulo) {
      navigation.setOptions({ title: libro.titulo });
    }
  }, [libro?.titulo, navigation]);

  useEffect(() => {
    setInputPage(String(page));
  }, [page]);

  useEffect(() => {
    if (libroId) {
      setLastPage(libroId, page);
    }
  }, [libroId, page, setLastPage]);

  useEffect(() => {
    if (!libro || isEpub) return;
    if (libro.estado !== 'Terminado' && libro.estado !== 'Leyendo') {
      updateLibro({ ...libro, estado: 'Leyendo' });
    }
  }, [isEpub, libro, updateLibro]);

  useEffect(() => {
    const loadPdf = async () => {
      if (!libro?.rutaArchivo || isEpub) return;
      setLoadingPdf(true);
      setWebReady(false);
      setLoadError('');
      setFileInfo(null);
      try {
        const info = await FileSystem.getInfoAsync(libro.rutaArchivo);
        setFileInfo(info);
        if (!info.exists) {
          throw new Error('El archivo no existe en la ruta indicada.');
        }
        const base64 = await FileSystem.readAsStringAsync(libro.rutaArchivo, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const html = buildPdfHtml(base64, initialPageRef.current);
        setHtmlContent(html);
      } catch (error) {
        const message = error?.message || 'No se pudo cargar el PDF.';
        setLoadError(message);
        setHtmlContent(buildErrorHtml(message));
      } finally {
        setLoadingPdf(false);
      }
    };

    loadPdf();
  }, [libro?.rutaArchivo, isEpub]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleFirst = useCallback(() => {
    setPage(1);
  }, []);

  const handleLast = useCallback(() => {
    if (pageCount > 0) {
      setPage(pageCount);
    }
  }, [pageCount]);

  const handlePrev = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setPage((prev) => (pageCount ? Math.min(pageCount, prev + 1) : prev + 1));
  }, [pageCount]);

  const handleJump = useCallback(() => {
    const parsed = Number.parseInt(inputPage, 10);
    if (!parsed) return;
    if (pageCount) {
      setPage(Math.min(Math.max(parsed, 1), pageCount));
      return;
    }
    setPage(Math.max(parsed, 1));
  }, [inputPage, pageCount]);

  const handleZoomOut = useCallback(() => {
    const nextScale = Math.max(0.7, Number((scale - 0.1).toFixed(2)));
    setScale(nextScale);
    if (webRef.current) {
      webRef.current.injectJavaScript(`window.setScale(${nextScale}); true;`);
    }
  }, [scale]);

  const handleZoomIn = useCallback(() => {
    const nextScale = Math.min(3, Number((scale + 0.1).toFixed(2)));
    setScale(nextScale);
    if (webRef.current) {
      webRef.current.injectJavaScript(`window.setScale(${nextScale}); true;`);
    }
  }, [scale]);

  const handleWebMessage = useCallback((event) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data);
      if (payload.type === 'loaded') {
        setPageCount(payload.pageCount || 0);
        setWebReady(true);
      }
      if (payload.type === 'pageChanged') {
        setPage(payload.page || 1);
      }
    } catch (error) {
      // ignore
    }
  }, []);

  const progressRatio = pageCount > 1 ? (page - 1) / (pageCount - 1) : 0;
  const thumbLeft = progressRatio * sliderWidth;

  useEffect(() => {
    if (!webReady || !webRef.current) return;
    webRef.current.injectJavaScript(`window.setPage(${page}); true;`);
  }, [page, webReady]);

  useEffect(() => {
    if (!libro || !pageCount) return;
    if (page >= pageCount && libro.estado !== 'Terminado') {
      updateLibro({ ...libro, estado: 'Terminado' });
    }
  }, [libro, page, pageCount, updateLibro]);

  const handleTrackPress = useCallback((evt) => {
    if (!pageCount) return;
    const x = evt.nativeEvent.locationX;
    const ratio = Math.min(Math.max(x / sliderWidth, 0), 1);
    const nextPage = Math.round(1 + ratio * (pageCount - 1));
    setPage(nextPage);
  }, [pageCount, sliderWidth]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      dragStartRatio.current = progressRatio;
    },
    onPanResponderMove: (_, gesture) => {
      if (!pageCount) return;
      const ratioDelta = sliderWidth ? gesture.dx / sliderWidth : 0;
      const nextRatio = Math.min(Math.max(dragStartRatio.current + ratioDelta, 0), 1);
      const nextPage = Math.round(1 + nextRatio * (pageCount - 1));
      setPage(nextPage);
    },
  }), [pageCount, progressRatio, sliderWidth]);

  if (!libro || !libro.rutaArchivo) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Sin archivo</Text>
        <Text style={styles.emptyText}>No encontramos un PDF para leer.</Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={handleClose}>
          <Text style={styles.emptyBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isEpub) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Vista EPUB básica</Text>
        <Text style={styles.emptyText}>
          Este archivo EPUB se abrirá en una app externa mientras implementamos la lectura interna.
        </Text>
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={() => Linking.openURL(libro.rutaArchivo)}
        >
          <Text style={styles.emptyBtnText}>Abrir EPUB</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleClose}>
          <Text style={styles.secondaryBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.topBar, { opacity: fadeAnim }]}
      >
        <TouchableOpacity style={styles.topBtn} onPress={handleClose}>
          <Text style={styles.topBtnText}>⟵</Text>
        </TouchableOpacity>
        <View style={styles.topTitleWrap}>
          <Text style={styles.topTitle} numberOfLines={1}>{libro.titulo}</Text>
          <Text style={styles.topSubtitle}>
            Página {page} de {pageCount || '—'}
          </Text>
        </View>
        <View style={styles.progressChip}>
          <Text style={styles.progressText}>{Math.round(progressRatio * 100)}%</Text>
        </View>
      </Animated.View>

      <View style={styles.readerWrapper}>
        {loadingPdf && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={styles.loaderText}>Cargando PDF...</Text>
            {!!loadError && (
              <Text style={styles.loaderError}>{loadError}</Text>
            )}
            {!!fileInfo && (
              <Text style={styles.loaderHint} numberOfLines={3}>
                Ruta: {libro?.rutaArchivo}
                {'\n'}Existe: {String(fileInfo.exists)}
                {'\n'}Tamano: {fileInfo.size || 0} bytes
              </Text>
            )}
          </View>
        )}
        <WebView
          ref={webRef}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          onMessage={handleWebMessage}
          source={{ html: htmlContent, baseUrl: '' }}
          style={[styles.webview, isLandscape && styles.webviewLandscape]}
        />
      </View>

      <Animated.View style={[styles.bottomBar, { opacity: fadeAnim }]}>
        <View style={styles.pageControls}>
          <TouchableOpacity style={styles.controlBtn} onPress={handleFirst}>
            <Text style={styles.controlText}>⏮</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={handlePrev}>
            <Text style={styles.controlText}>◀</Text>
          </TouchableOpacity>
          <View style={styles.pageInputWrap}>
            <TextInput
              style={styles.pageInput}
              value={inputPage}
              onChangeText={setInputPage}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={handleJump}
            />
          </View>
          <TouchableOpacity style={styles.controlBtn} onPress={handleNext}>
            <Text style={styles.controlText}>▶</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={handleLast}>
            <Text style={styles.controlText}>⏭</Text>
          </TouchableOpacity>
        </View>
        <View
          style={styles.sliderTrack}
          onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleTrackPress}
        >
          <View style={[styles.sliderFill, { width: `${progressRatio * 100}%` }]} />
          <View
            style={[styles.sliderThumb, { left: thumbLeft - 8 }]}
            {...panResponder.panHandlers}
          />
        </View>
      </Animated.View>
    </View>
  );
}

function buildPdfHtml(base64, initialPage) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body { margin: 0; padding: 0; background: #ffffff; }
    #viewer { display: flex; align-items: center; justify-content: center; height: 100vh; }
    canvas { max-width: 100%; max-height: 100%; }
  </style>
</head>
<body>
  <div id="viewer"><canvas id="pdf-canvas"></canvas></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script>
    const pdfData = "${base64}";
    const initialPage = ${initialPage || 1};
    const canvas = document.getElementById('pdf-canvas');
    const ctx = canvas.getContext('2d');
    let pdfDoc = null;
    let currentPage = initialPage;
    let totalPages = 0;
    let scale = 1.1;

    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    function renderPage(pageNum) {
      if (!pdfDoc) return;
      pdfDoc.getPage(pageNum).then((page) => {
        const viewport = page.getViewport({ scale, rotation: page.rotate });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = { canvasContext: ctx, viewport };
        page.render(renderContext);
        currentPage = pageNum;
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'pageChanged',
          page: currentPage,
        }));
        setTimeout(() => {
          if (currentPage === pageNum) {
            page.render(renderContext);
          }
        }, 30);
      });
    }

    function setPage(pageNum) {
      if (!pdfDoc) return;
      const nextPage = Math.min(Math.max(pageNum, 1), totalPages);
      renderPage(nextPage);
    }

    function setScale(nextScale) {
      scale = Math.min(Math.max(nextScale, 0.7), 3);
      renderPage(currentPage);
    }

    window.setPage = setPage;
    window.setScale = setScale;

    let touchStartX = null;
    document.addEventListener('touchstart', (evt) => {
      touchStartX = evt.touches?.[0]?.clientX ?? null;
    });
    document.addEventListener('touchend', (evt) => {
      if (touchStartX === null) return;
      const endX = evt.changedTouches?.[0]?.clientX ?? touchStartX;
      const delta = endX - touchStartX;
      if (Math.abs(delta) > 40) {
        if (delta < 0) {
          setPage(currentPage + 1);
        } else {
          setPage(currentPage - 1);
        }
      }
      touchStartX = null;
    });

    const pdfUrl = "data:application/pdf;base64," + pdfData;
    pdfjsLib.getDocument(pdfUrl).promise.then((doc) => {
      pdfDoc = doc;
      totalPages = doc.numPages;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'loaded',
        pageCount: totalPages,
      }));
      renderPage(currentPage);
    }).catch(() => {
      document.getElementById('viewer').innerText = 'No se pudo abrir el PDF.';
    });
  </script>
</body>
</html>`;
}

function buildErrorHtml(message) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body { margin: 0; padding: 0; background: #ffffff; }
    #wrap { display: flex; align-items: center; justify-content: center; height: 100vh; color: #6b7280; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; }
  </style>
</head>
<body>
  <div id="wrap">${message}</div>
</body>
</html>`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fb',
  },
  topBar: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBtnText: {
    fontSize: 18,
    color: '#4f46e5',
    fontWeight: '700',
    lineHeight: 18,
  },
  topTitleWrap: {
    flex: 1,
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  topSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  progressChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4f46e5',
  },
  readerWrapper: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  webview: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  webviewLandscape: {
    marginHorizontal: 16,
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 2,
    backgroundColor: 'rgba(245, 246, 251, 0.85)',
  },
  loaderText: {
    fontSize: 13,
    color: '#6b7280',
  },
  loaderError: {
    fontSize: 12,
    color: '#ef4444',
    textAlign: 'center',
  },
  loaderHint: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  pageControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    fontSize: 16,
    color: '#4f46e5',
    fontWeight: '700',
  },
  pageInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  pageInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    textAlign: 'center',
    color: '#1a1a2e',
  },
  sliderTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: '#4f46e5',
  },
  sliderThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#4f46e5',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  secondaryBtnText: {
    color: '#6b7280',
    fontWeight: '700',
  },
});
