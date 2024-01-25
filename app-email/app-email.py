from faststream import FastStream
from faststream.rabbit import RabbitBroker
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

gmail_user = 'swiftlyshop021@gmail.com'
gmail_app_password = 'app-password-for-your-gmail' # Be careful not to upload password to github!

sent_from = gmail_user

broker = RabbitBroker(host="rabbitmq")
app = FastStream(broker)


@broker.subscriber("to_email")
async def handle(msg):
    print("I received: ", msg)

    sent_to = msg["to"]
    sent_subject = msg["subject"]
    sent_body = msg["body"]

    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.ehlo()
        server.login(gmail_user, gmail_app_password)

        msg = MIMEMultipart()
        msg['From'] = sent_from
        msg['To'] = sent_to
        msg['Subject'] = sent_subject
        msg.attach(MIMEText(sent_body, 'plain'))

        email_text = msg.as_string()
        
        server.sendmail(sent_from, sent_to, email_text)
        server.close()

        print('Email sent!')
    except Exception as exception:
        print("Error: %s!\n\n" % exception)
        return "Error sending email"

    print('Email sent successfully!')
    return 'Email sent successfully!'


