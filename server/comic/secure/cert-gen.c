#include <stdio.h>
#include <stdlib.h>
#include <unistd.h> /* for fork */
#include <sys/types.h> /* for pid_t */
#include <sys/wait.h> /* for wait */

char key_command[1000] = "openssl genrsa -out key/key.pem";
char csr_command[1000] = "openssl req -new -key key/key.pem -out cert/csr.pem -subj \"/C=Vi/ST=abc/L=local/O=Shartube/OU=Shartube/CN=R3/emailAddress= support@mail.folody.xyz/\"";
char cert_command[1000] = "openssl x509 -req -days 999 -in cert/csr.pem -signkey key/key.pem -out cert/ca-cert.pem";
char verify_command[1000] = "openssl verify -CAfile cert/ca-cert.pem cert/ca-cert.pem";
char verify_crl[1000] = "openssl x509 -noout -text -in cert/ca-cert.pem | grep -A 4 'X509v3 CRL Distribution Points'";

int run(){
    system(key_command);
    sleep(1);
    system(csr_command);
    sleep(1);
    system(cert_command);
    sleep(1);
    system(verify_command);
    sleep(1);
    system(verify_crl);
}

int main(){
    /*Spawn a child to run the program.*/
    pid_t pid=fork();
    if (pid==0) { /* child process */
        // check operating system
        #ifdef __linux__
            system("rm -rf cert/*");
            system("rm -rf key/*");
            run();
        // check windows
        #elif _WIN32
            system("del /f /q cert\\*");
            system("del /f /q key\\*");
            run();
        // check win64
        #elif _WIN64
            system("del /f /q cert\\*");
            system("del /f /q key\\*");
            run();
        // check mac os
        #elif __APPLE__
            system("rm -rf cert/*");
            system("rm -rf key/*");
            run();
        #endif
            exit(0);
        
        exit(127); /* only if execv fails */
    }
    else { /* pid!=0; parent process */
        waitpid(pid,0,0); /* wait for child to exit */
    }
    return 0;
}