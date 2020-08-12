# production environment
FROM fholzer/nginx-brotli:latest
#RUN rm -rf /etc/nginx/conf.d

#COPY nginx/conf /etc/nginx
#COPY nginx/ssl /etc/nginx/ssl

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
